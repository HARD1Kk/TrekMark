  import dotenv from 'dotenv';
  import express from 'express';
  import bodyParser from 'body-parser';
  import pkg from 'pg';
  const { Client } = pkg;
  dotenv.config(); // Load environment variables from .env file

  const app = express();
  const port = 3000;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));

  const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });


  db.connect();

  async function checkVisisted() {

    const country = await db.query("SELECT country_code FROM visited_countries")
  
    let countries = [];
    country.rows.forEach(element => {
      countries.push(element.country_code)

    })
    return countries;

  }

  app.get("/", async (req, res) => {

    const countries = await checkVisisted();
    res.render("index.ejs", { countries: countries, total: countries.length })
  });



  app.post("/add", async (req, res) => {

    const countryName = req.body.country;
    console.log(countryName);
    try {
      const result = await db.query("SELECT country_code from countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ; ",[ countryName.toLowerCase() ]);
        // Checking if that country exists in the database 
      //here we get the country code from the user entered country name

      console.log(result);



      const countryCode = result.rows[0].country_code;
      console.log(countryCode);

      try {
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);

        res.redirect("/");
      } catch (error) {
        const countries = await checkVisisted();
        res.render("index.ejs", {
          error: "Country name already added",
          countries: countries,
          total: countries.length
        })
      }
    }
    catch (error) {
      const countries = await checkVisisted();
      res.render("index.ejs", {
        error: "Try again , Country name does not exist!",
        countries: countries,
        total: countries.length
      })
    }
  });




  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
