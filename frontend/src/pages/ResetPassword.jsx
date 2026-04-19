
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");



  const resetPassword = async () => {

    if(!password || !confirmPassword){
      alert("Please fill all fields");
      return;
    }

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    try{

      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/reset-password`,
        {
          token,
          password
        }
      );

      setMessage(res.data.message);

      setTimeout(()=>{
        navigate("/login");
      },2000);

    }
    catch(err){

      setMessage(
        err.response?.data?.message ||
        "Password reset failed"
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
    Reset Password
  </h1>



  <input
    type="password"
    placeholder="New Password"
    className="w-full p-3 mb-4 bg-white/30 text-white placeholder-white/80
               border border-white/40 rounded-xl outline-none"
    onChange={(e)=>setPassword(e.target.value)}
  />



  <input
    type="password"
    placeholder="Confirm Password"
    className="w-full p-3 mb-4 bg-white/30 text-white placeholder-white/80
               border border-white/40 rounded-xl outline-none"
    onChange={(e)=>setConfirmPassword(e.target.value)}
  />



  <button
    onClick={resetPassword}
    disabled={loading}
    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600
               text-white rounded-xl font-semibold"
  >
    {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;

