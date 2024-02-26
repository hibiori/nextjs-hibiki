import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '/styles/theme';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
   return (
     <>
       <Head>
         <title>Next.js handson</title>
       </Head>
       <ThemeProvider theme={theme}>
         <CssBaseline />
         <Component {...pageProps} />
       </ThemeProvider>
     </>
   );
}

export default MyApp;