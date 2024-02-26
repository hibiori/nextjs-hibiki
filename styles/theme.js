import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { blue, purple } from '@mui/material/colors';
import { cyan, amber } from '@mui/material/colors';


const theme = createTheme({
    palette: {
        primary: cyan,
        secondary: amber,
      },

});

export default theme;