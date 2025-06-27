
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface ProfileSectionProps {
  onProfileUpdate?: () => void;
}

const ProfileSection = ({ onProfileUpdate }: ProfileSectionProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setFormData({
            name: '',
            email: user.email || '',
            phone: '',
            username: '',
            avatar_url: ''
          });
          return;
        }

        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            username: data.username || '',
            avatar_url: data.avatar_url || ''
          });
        } else {
          setFormData({
            name: '',
            email: user.email || '',
            phone: '',
            username: '',
            avatar_url: ''
          });
        }
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        setFormData({
          name: '',
          email: user.email || '',
          phone: '',
          username: '',
          avatar_url: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const ensureAvatarsBucket = async () => {
    try {
      // Primeiro tentar listar buckets para ver se o bucket 'avatars' existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucket) {
        console.log('Avatars bucket not found, creating...');
        
        // Criar o bucket
        const { error: createError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/*']
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }

        console.log('Avatars bucket created successfully');
      }

      return true;
    } catch (error) {
      console.error('Error ensuring avatars bucket:', error);
      return false;
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast({
          title: "Erro",
          description: "Selecione uma imagem para upload.",
          variant: "destructive"
        });
        return;
      }

      const file = event.target.files[0];
      
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }

      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      console.log('Starting upload process...');

      // Garantir que o bucket existe
      const bucketReady = await ensureAvatarsBucket();
      if (!bucketReady) {
        toast({
          title: "Erro",
          description: "Erro ao preparar o storage para upload.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Upload do arquivo para o bucket avatars
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem: " + uploadError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Upload successful:', uploadData);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        console.log('Public URL obtained:', urlData.publicUrl);
        setFormData({ ...formData, avatar_url: urlData.publicUrl });
        
        toast({
          title: "Sucesso!",
          description: "Foto enviada com sucesso.",
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado ao fazer upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Save error:', error);
        if (error.code === '23505') {
          toast({
            title: "Erro",
            description: "Este nome de usuário já está em uso.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao salvar perfil: " + error.message,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      });

      setIsEditing(false);
      fetchProfile();
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">Meu Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src={formData.avatar_url || profile?.avatar_url || ''} alt="Avatar" />
            <AvatarFallback className="text-2xl">
              {formData.name?.charAt(0) || profile?.name?.charAt(0) || formData.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <Label htmlFor="username">Nome de Usuário *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!isEditing}
              placeholder="Digite seu nome de usuário único"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="Digite seu telefone"
            />
          </div>

          {isEditing && (
            <div>
              <Label htmlFor="avatar">Upload de Foto de Perfil</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
              </p>
              {uploading && (
                <p className="text-sm text-blue-500 mt-1 flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando foto...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                disabled={loading || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                variant="outline"
                className="flex-1"
                disabled={loading || uploading}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
