import "../css/pages/Login.css";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            required
          />

          <button className="btn" type="submit">Log In</button>
        </form>

        <div className="divider">or</div>

        <button
          className="btn-google"
          onClick={() => alert("Google login coming soon")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Continue with Google
        </button>

        <div className="footer">
          Don’t have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
