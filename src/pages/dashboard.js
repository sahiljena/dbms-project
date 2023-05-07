import { useEffect, useState } from "react";
import FilePopUp from "../components/FilePopUp";
import { toast } from "react-toastify";
export default function Dashbaord({ handleLogout, token }) {
  const [user, setUser] = useState({});
  const [images, setImages] = useState([]);
  const [show, setShow] = useState(false);
  const [editFile, setEditFile] = useState({});
  const [sharedImages, setSharedImages] = useState([]);

  const [fileUploaded, setFileUploaded] = useState("");
  const [downloadShow, setDownloadShow] = useState(false);

  let b64token = btoa(token);
  const fetchUserImages = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("http://localhost:5000/user/images", requestOptions)
      .then((response) => response.json())
      .then((result) => setImages(result?.data))
      .catch((error) => console.log("error", error));
  };
  const fetchSharedImages = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("http://localhost:5000/files/sharedwithme", requestOptions)
      .then((response) => response.json())
      .then((result) => setSharedImages(result?.media))
      .catch((error) => console.log("error", error));
  };

  const handleFileUpload = (e) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    var formdata = new FormData();
    formdata.append("image", e.target.files[0]);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("http://localhost:5000/upload", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        toast.success("File Uploaded");
      })
      .catch((error) => console.log("error", error));
  };
  const FileCard = ({ filename, created_at }) => {
    return (
      <>
        <div className="p-3 bg-blue-50 shadow-md rounded">
          <img
            className="w-36 h-36 rounded"
            src={`http://localhost:5000/files/${filename}?token=${b64token}`}
          />
          <div>
            <p className="font-bold text-gray-700 truncate w-36">
              {filename?.slice(14)}
            </p>
            <p className="text-xs text-gray-500 font-semibold">
              🕜{created_at?.split("T")[0]} - {created_at?.split("T")[1]}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="bg-blue-100 p-1 rounded"
                onClick={() => {
                  setEditFile({
                    filename: filename,
                    fileLink: `http://localhost:5000/files/${filename}?token=${b64token}`,
                    created_at: created_at,
                  });
                  setShow(!show);
                }}
              >
                🛠️
              </button>
            </div>
          </div>
        </div>
        {show && (
          <FilePopUp editFile={editFile} close={closeModal} token={token} />
        )}
      </>
    );
  };
  useEffect(() => {
    fetchUserImages();
    fetchSharedImages();
  }, []);

  const closeModal = () => {
    setShow(!show);
  };

  return (
    <>
      <div className="p-4 bg-gray-50">
        <nav className="bg-blue-50 p-4  rounded-lg flex justify-between shadow-md">
          <h1 className="text-2xl font-semibold">🚀shareFree🚀</h1>
          <div className="gap-2 flex">
            {fileUploaded}
            <button
              type="file"
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => setDownloadShow(!downloadShow)}
            >
              📁 Upload
            </button>
            <button
              className="bg-red-600 text-white rounded px-2 py-1"
              onClick={() => handleLogout()}
            >
              🚪 logout
            </button>
          </div>
        </nav>
        <div className=" mt-10">
          <div>
            {downloadShow && (
              <>
                <input type="file" onChange={(e) => handleFileUpload(e)} />
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-2 mb-2">My Files</h2>
          <div className="flex gap-3">
            <div className=""></div>

            {images?.map((file) => {
              return (
                <FileCard
                  key={file?.id}
                  filename={file?.filename}
                  created_at={file?.created_at}
                />
              );
            })}
          </div>
        </div>
        <div className=" mt-10">
          <h2 className="text-xl font-semibold mt-2 mb-2">Shared with me</h2>
          <div className="flex gap-3">
            <div className=""></div>

            {sharedImages?.map((file) => {
              return (
                <FileCard
                  key={file?.id}
                  filename={file?.filename}
                  created_at={file?.created_at}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
