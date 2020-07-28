import app from "./app";
import dotenv from "dotenv";

const port = parseInt(process.env.PORT);

const server = new app()
  .Start(port)
  .then((port) => console.log(`Server running on port ${port}`))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

export default server;
