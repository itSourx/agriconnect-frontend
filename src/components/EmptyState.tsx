import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  title: string;
  description: string;
  image: string;
  buttonText?: string;
  buttonAction?: () => void;
  buttonLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  image,
  buttonText,
  buttonAction,
  buttonLink
}) => {
  const router = useRouter();

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    } else if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center'
      }}
    >
      <Box
        component="img"
        src={image}
        alt="Empty state illustration"
        sx={{
          width: '100%',
          maxWidth: 400,
          mb: 4,
          height: 'auto'
        }}
      />
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {description}
      </Typography>
      {(buttonText && (buttonAction || buttonLink)) && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          sx={{ mt: 2 }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState; 