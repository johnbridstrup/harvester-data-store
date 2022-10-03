import s3FileService from "../features/s3file/s3fileService";

export const handleDownload = async (fileObj, token) => {
  const s3fileUrl = await s3FileService.s3FileDownload(fileObj.url, token);
  const link = document.createElement("a");
  link.href = s3fileUrl;
  link.setAttribute("target", `_blank`);
  link.setAttribute("rel", "noopener");
  document.body.appendChild(link);
  link.click();
};
