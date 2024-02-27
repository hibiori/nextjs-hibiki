import React from 'react';
 /** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const styles = {
    Container: css`
    background-color: red;
    `,
    box: css`
    background-color:orange;
    `
};

const Mui = () => {
  return (
      <Container component="main" maxWidth="xs" css={styles.container}>
        <Box
        component="from"
        noValidate
        sx={{
            marginTop: 8, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
        css={styles.box}
        >
        <TextField label="キーワードを入力してください" variant="standard" margin="normal" fullWidth />
        <Button variant="contained" margin="normal" fullWidth>
          検索
        </Button>
      </Box>
    </Container>
  );
};

export default Mui;