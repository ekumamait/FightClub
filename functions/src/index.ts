import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

const serviceAccount = require("./../../functions/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wstrn-514a9.firebaseio.com"
});

const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);


// landing page
app.get('/warm', (req, res) => {
    res.send('Warming up friend.');
})

// user registration
app.post('/signup', async (request, response) => {
  try {
    const { username, email, password } = request.body;
    const data = {
      username,
      email, 
      password 
    } 
    const userRef = await db.collection('users').add(data);
    const user = await userRef.get();

    response.json({
      id: userRef.id,
      data: user
    });

  } catch(error){

    response.status(500).send(error);

  }
});

// user log in 
app.post('/signin', async (request, response) => {
  try {
    const { email, password } = request.body;
    const data = {
      email, 
      password 
    } 

    // check if user exists in database then return success message
    const userRef = await db.collection('users').add(data);
    const user = await userRef.get();

    response.json({
      id: userRef.id,
      data: user
    });

  } catch(error){

    response.status(500).send(error);

  }
});

// posting a fight 
app.post('/fights', async (request, response) => {
    try {
      const { winner, loser, title } = request.body;
      const data = {
        winner,
        loser,
        title
      } 
      const fightRef = await db.collection('fights').add(data);
      const fight = await fightRef.get();
  
      response.json({
        id: fightRef.id,
        data: fight.data()
      });
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  });

  // getting a fight by its ID 
  app.get('/fights/:id', async (request, response) => {
    try {
      const fightId = request.params.id;
  
      if (!fightId) throw new Error('Fight ID is required');
  
      const fight = await db.collection('fights').doc(fightId).get();
  
      if (!fight.exists){
          throw new Error('Fight doesnt exist.')
      }
  
      response.json({
        id: fight.id,
        data: fight.data()
      });
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

  // get all fights available
  app.get('/fights', async (request, response) => {
    try {
  
      const fightQuerySnapshot = await db.collection('fights').get();
      const fights:any[] = [];
      fightQuerySnapshot.forEach(
          (doc) => {
              fights.push({
                  id: doc.id,
                  data: doc.data()
              });
          }
      );
  
      response.json(fights);
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

  // update the fights
  app.put('/fights/:id', async (request, response) => {
    try {
  
      const fightId = request.params.id;
      const title = request.body.title;
  
      if (!fightId) throw new Error('id is blank');
  
      if (!title) throw new Error('Title is required');
  
      const data = { 
          title
      };

      await db.collection('fights')
          .doc(fightId)
          .set(data, { merge: true });
  
      response.json({
          id: fightId,
          data
      })
  
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

  // delete a fight
  app.delete('/fights/:id', async (request, response) => {
    try {
  
      const fightId = request.params.id;
  
      if (!fightId) throw new Error('id is blank');
  
      await db.collection('fights')
          .doc(fightId)
          .delete();
  
      response.json({
          id: fightId,
      })
  
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });
  