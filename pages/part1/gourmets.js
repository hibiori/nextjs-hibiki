import React, { useEffect } from 'react';
import getConfig from 'next/config';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

const fetchData = async (keyword) => {
  const { API_HOST } = getConfig().publicRuntimeConfig;

  const query = new URLSearchParams();
  if (keyword) query.set('keyword', keyword);

  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/shops?${query.toString()}`);
  return await res.json();
};

const Shops = ({ firstViewShops }) => {
    const [keyword, setKeyword] = React.useState('');
    const [shops, setShops] = React.useState([]);

    useEffect(() => {
        setShops(firstViewShops);
    }, [firstViewShops]);
    
    const onSearchClick = async () => {
        const data = await fetchData(keyword);
        
        setShops(data);
        setKeyword('');
    };

  return (
    <Container component="main" maxWidth="md">
        <Box
            component="form"
            noValidate
            maxWidth="md"
            sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            }}
        >
            <TextField
            label="キーワードを入力してください"
            variant="standard"
            margin="normal"
            fullWidth
            value={keyword}
            onChange={(event) => {
                setKeyword(event.target.value);
            }}
            />
            <Button
            variant="contained"
            margin="normal"
            fullWidth
            onClick={() => {
                onSearchClick();
            }}
            >
            検索
            </Button>
        </Box>
        <Box
             component="form"
             noValidate
             sx={{
               marginTop: 8,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
             }}
        >
            <List>
               {shops.map((shop) => {
                 return (
                   <ListItem key={shop.id}>
                     <ListItemButton
                       onClick={() => {
                         // TODO: goto shop detail
                       }}
                     >
                       <ListItemAvatar>
                         <Avatar alt={shop.name} src={shop.logo_image} />
                       </ListItemAvatar>
                       <ListItemText
                         primary={`${shop.genre.name} ${shop.name}`}
                         secondary={
                           <>
                             <Typography variant="body1" component="span">
                               {`${shop.catch} ${shop.shop_detail_memo}`}
                             </Typography>
                             <Typography variant="caption">{shop.address}</Typography>
                           </>
                         }
                       />
                     </ListItemButton>
                   </ListItem>
                 );
               })}
            </List>
        </Box>
       </Container>
    );
};

export const getServerSideProps = async (req) => {
  const data = await fetchData(req.query.keyword);

  return {
    props: {
        firstViewShops: data,
    },
  };
};

export default Shops;