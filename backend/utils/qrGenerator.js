import QRCode from "qrcode";
// payload is an object that will be JSON.stringify'd (contains classId, subject, teacherId, timestamp)
export const generateQR = async (payload) => {
  const json = JSON.stringify(payload);
  return QRCode.toDataURL(json); // dataURL image (base64)
};
