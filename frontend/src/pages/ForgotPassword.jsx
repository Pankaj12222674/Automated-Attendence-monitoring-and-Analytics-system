
import { useState } from "react";
import axios from "axios";

function ForgotPassword() {

  const [email,setEmail] = useState("");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");



  const sendResetLink = async () => {

    if(!email){
      alert("Please enter your email");
      return;
    }

    try{

      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);

    }
    catch(err){

      setMessage(
        err.response?.data?.message ||
        "Failed to send reset email"
      );

    }
    finally{
      setLoading(false);
    }

  };



  return(

  <div className="min-h-screen flex items-center justify-center
                  bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                  p-6">


  <div className="w-full max-w-md backdrop-blur-xl bg-white/20
                  border border-white/30 rounded-3xl p-8 shadow-2xl">


  <h1 className="text-3xl font-bold text-white text-center mb-6">
    Forgot Password
  </h1>



  <input
    type="email"
    placeholder="Enter your email"
    className="w-full p-3 mb-4 bg-white/30 text-white placeholder-white/80
               border border-white/40 rounded-xl outline-none"
    onChange={(e)=>setEmail(e.target.value)}
  />



  <button
    onClick={sendResetLink}
    disabled={loading}
    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600
               text-white rounded-xl font-semibold"
  >
    {loading ? "Sending..." : "Send Reset Link"}
  </button>



  {message && (

    <p className="text-center text-white mt-4">
      {message}
    </p>

  )}



  <p className="text-center text-white/80 text-sm mt-6">

    Back to

    <a
      href="/login"
      className="underline ml-1 hover:text-pink-200"
    >
      Login
    </a>

  </p>



  </div>

  </div>

  );

}

export default ForgotPassword;

