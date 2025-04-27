import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Card, CardContent, Grid, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';

// Composant stylisé pour l'aperçu des images
const ImgStyled = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`
}));

// Zone de dépôt stylisée
const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const TestPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Filtrer pour ne garder que les images
    const imageFiles = newFiles.filter(file => 
      ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
    );

    if (imageFiles.length === 0) {
      setError("Type d'image invalide. Utilisez JPG, PNG ou GIF.");
      return;
    }

    // Vérifier la taille des fichiers (max 5 Mo)
    if (imageFiles.some(file => file.size > 5 * 1024 * 1024)) {
      setError("La taille de l'image doit être inférieure à 5 Mo.");
      return;
    }

    setFiles(prev => [...prev, ...imageFiles]);
    setPreviews(prev => [...prev, ...imageFiles.map(file => URL.createObjectURL(file))]);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins une image à télécharger.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(file);
      });

      console.log(formData);

      

      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/upload', {
        method: 'POST',
        body: formData
      });

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload des images");
      }

      const data = await response.json();
      toast.success(`${files.length} image(s) téléchargée(s) avec succès`);
      console.log('Upload response:', data);
      
      // Réinitialiser les fichiers après un upload réussi
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de l'upload";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h4' mb={1}>
                Page de Test - Upload d'Images SANS TOKEN : https://agriconnect-bc17856a61b8.herokuapp.com/upload
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Télécharger des images
              </Typography>              

              
              <DropZone
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  backgroundColor: isDragging ? 'action.hover' : 'background.default',
                  borderColor: isDragging ? 'primary.main' : 'grey.300',
                  mb: 3
                }}
              >
                <input 
                  type='file' 
                  accept='image/*' 
                  multiple 
                  hidden 
                  onChange={handleFileChange} 
                  id='file-upload' 
                />
                <label htmlFor='file-upload'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant='body1'>
                      Glissez-déposez des images ici ou cliquez pour sélectionner
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      JPG, PNG ou GIF (max 5 Mo par image)
                    </Typography>
                  </Box>
                </label>
              </DropZone>

              {error && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {previews.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    Images sélectionnées ({previews.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {previews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Button
                          size='small'
                          variant='contained'
                          color='error'
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            minWidth: 'auto',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            p: 0
                          }}
                          onClick={() => handleRemoveFile(index)}
                        >
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Button
                variant='contained'
                color='primary'
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
                startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {isUploading ? 'Téléchargement en cours...' : 'Télécharger les images'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestPage; 