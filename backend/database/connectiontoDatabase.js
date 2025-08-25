/* ============================================================================
 * @file        backend/database/connectiontoDatabase.js
 * @brief       MongoDB connection helper.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import mongoose from "mongoose"

export const connectToDatabase = async () => {
  try{
      const connection = await mongoose.connect(process.env.MONGO_URI)
      
  }
  catch(error){
    console.log('failed')
  }
}
