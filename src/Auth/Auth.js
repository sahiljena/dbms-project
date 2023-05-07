import { useState } from "react";

const Auth = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authType, setAuthType] = useState(0); // 0->new user, 1->exsisting user

  const handleAuth = (e) => {
    e.preventDefault();
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      username: email,
      password: password,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let service =
      authType === 0
        ? "http://localhost:5000/login"
        : "http://localhost:5000/users";

    fetch(service, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setToken(result?.token);
        localStorage.setItem("token", result?.token);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            🚀 shareFree
          </a>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                {authType === 0 ? "Sign" : "Signup"} in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="email"
                    required=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                        required=""
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleAuth(e)}
                  type="submit"
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  {authType === 1 ? "Sign up" : "Sign In"}
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  {authType === 0
                    ? "Don’t have an account yet? "
                    : "Already have a account? "}
                  <button
                    onClick={() => {
                      if (authType === 1) setAuthType(0);
                      else setAuthType(1);
                    }}
                    type="button"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    {authType === 0 ? "Sign up" : "Sign In"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Auth;
