import axios from "axios";

export function generateOTP() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

export async function sendOTP(mobile, otp) {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.SMS_API_KEY}/SMS/${mobile}/${otp}/`
    );
    const status = await response.status;
    if (status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
