import { useState } from "react";
import { toast } from "react-toastify";
export default function FilePopUp({ editFile, close, token }) {
  const [users, setUsers] = useState([]);
  const handleSearch = (username) => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      `http://localhost:5000/finduserquery?username=${username}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setUsers(result?.users))
      .catch((error) => console.log("error", error));
  };

  const handleDownload = (link) => {
    // Create an anchor element with download attribute
    const downloadLink = document.createElement("a");
    downloadLink.href = link;
    downloadLink.download = "image.jpg";
    downloadLink.click();
  };

  const addAccess = (filename, userId) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", token);

    var raw = JSON.stringify({
      user: userId,
      filename: filename,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:5000/file/addAccess", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.error) toast.error(result.error);
        if (result.message) toast.success(result.message);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <div className="w-full h-full bg-gray-600 relative z-50">
      <div
        id="defaultModal"
        tabIndex={-1}
        aria-hidden="true"
        className={`fixed m-auto z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative w-full max-h-full">
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow">
            {/* Modal header */}
            <div className="flex items-start justify-between p-4 border-b rounded-t ">
              <h3 className="text-xl font-semibold text-gray-900 ">
                Modify - {editFile?.filename}
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
                data-modal-hide="defaultModal"
                onClick={() => close()}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-6 space-y-6 flex justify-around">
              <div>
                <img src={editFile?.fileLink} className="h-auto max-w-lg" />
              </div>
              <div className="w-6/12">
                {token && (
                  <div>
                    <h4 className="font-semibold text-xl"> 🔐 Access List</h4>
                    <input
                      type="search"
                      className="p-2 border rounded w-full mt-3"
                      placeholder="Type username..."
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    <ul className="mt-4">
                      {users?.map((user, idx) => {
                        return (
                          <li className="bg-gray-100 rounded p-2 m-1 flex justify-between">
                            {idx + 1}. {user?.username}
                            <button
                              onClick={() =>
                                addAccess(editFile?.filename, user?.id)
                              }
                              className="bg-blue-600 text-white p-1 rounded px-2 py-1 text-xs"
                            >
                              Add
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <a href={editFile?.fileLink} download>
                  <button
                    //onClick={() => handleDownload()}
                    className="text-lg bg-blue-600 text-white  p-3 rounded-full"
                  >
                    ⬇️ Download ⬇️
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
