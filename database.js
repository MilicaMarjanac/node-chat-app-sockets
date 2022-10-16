import mongoose from "mongoose";

class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(process.env.DB_CONNECTION)
      .then(() => {
        console.log("Connected to database!");
      })
      .catch(() => {
        console.log("Connection failed!");
      });
  }
}

export default new Database();
