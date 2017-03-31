# virus-game
Virus, the exciting multiplatform multiplayer turn-based digital board game!

**Installation**
Run `npm install` to install dependencies.
Compile server: `tsc -p server`.
Compile client: `tsc`.
Copy `server\example_config.json` to `sever\config.json` and modify it according to your database config.
Copy `db\seed_example.json` to `db\seed.json` and populate it with desired game users.

**Migration**
Run `npm run migrate` to migrate and seed database.

**Run**
Start server first: `npm start`. 
Then open in browser: `localhost:4228`. 
Enjoy!
