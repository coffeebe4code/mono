import uws from 'uws';
const port = 9001;

const app = uws
  .H3App({
    key_file_name: 'misc/key.pem',
    cert_file_name: 'misc/cert.pem',
    passphrase: '1234',
  })
  .get('/*', (res, req) => {
    res.end('H3llo World!');
  })
  .listen(port, token => {
    if (token) {
      console.log('Listening to port ' + port);
    } else {
      console.log('Failed to listen to port ' + port);
    }
  });
