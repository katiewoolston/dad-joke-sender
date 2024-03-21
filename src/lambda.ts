import { SES as SESClient, SendEmailCommandInput } from '@aws-sdk/client-ses';
import http from 'node:http';

const SES = new SESClient();

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;
const DAD_JOKE_URL = process.env.DAD_JOKE_URL;

const getDadJoke = async (url: string): Promise<string|undefined> => {
  const response: {joke: string} = await new Promise((resolve, reject) => {
    const req = http.request(
      url,
      res => {
        res.on("data", chunk => {
          const body = chunk.toString();
          resolve(body);
        });
      });
    req.on("error", e => {
      reject(e.message);
    });
    req.();
  });
  console.log("RESPONSE", response);
  return response ? response.joke : undefined;
};

const lambdaHandler = async () => {
  if (!(SENDER_EMAIL && RECIPIENT_EMAIL && DAD_JOKE_URL)) {
    throw new Error('Some environment variables missing');
  }

  console.log(`Sending an email to ${RECIPIENT_EMAIL}`);

  const joke = await getDadJoke(DAD_JOKE_URL);
    if (!joke) {
      console.log('No joke found today :(')
      return;
    }

  const params: SendEmailCommandInput = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [RECIPIENT_EMAIL],
    },
    Message: {
      Subject: {
        Data: undefined,
      },
      Body: {
        Text: {
          Data: `Your daily dose of laughs (or groans)`
        },
      }
    }


  }
  await SES.sendEmail(params);
}
lambdaHandler();
