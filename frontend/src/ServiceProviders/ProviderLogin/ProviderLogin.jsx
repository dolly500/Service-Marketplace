import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../src/assets/frontend_assets/Logo_for_Quickie_Chores_with_Icons-removebg-preview.png"

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:4000/api/auth/login-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      if (data.success) {
        setSuccess("Login successful!");
        
        // Store token and provider data
        localStorage.setItem("providerToken", data.token); 
        
        // Ensure provider object has role property
        const providerData = {
          ...data.provider,
          role: data.provider.role || "serviceProvider" // Set default role if missing
        };
        localStorage.setItem("provider", JSON.stringify(providerData));
        
        // Navigate immediately without setTimeout (common issue)
        navigate("/provider/dashboard", { replace: true });
        
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    formWrapper: {
      borderRadius: '20px',
      padding: '40px',
      minWidth: '400px',
      maxWidth: '500px',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },
    formWrapperBefore: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2d3748',
      letterSpacing: '-0.02em'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      color: '#2d3748',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#667eea',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)'
    },
    button: {
      width: '100%',
      padding: '8px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: loading ? '#a0aec0' : 'blue',
      border: 'none',
      borderRadius: '12px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      position: 'relative',
      overflow: 'hidden'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
    },
    errorMsg: {
      padding: '12px 16px',
      backgroundColor: '#fed7d7',
      color: '#c53030',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #feb2b2',
      textAlign: 'center'
    },
    successMsg: {
      padding: '12px 16px',
      backgroundColor: '#c6f6d5',
      color: '#22543d',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #9ae6b4',
      textAlign: 'center'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid #ffffff',
      borderRadius: '50%',
      borderTopColor: 'transparent',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '8px'
    }
  };

  const [focusedInput, setFocusedInput] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.formWrapper}>
          <div style={styles.formWrapperBefore}></div>
          
          <form style={styles.form} onSubmit={handleSubmit}>
           <div style={{display: 'flex', margin: '0 auto'}}>
             <img src={Logo} alt="" width="185vw"/>
           </div>
            <h2 style={styles.title}>Quickie Helper Login</h2>

            {error && <div style={styles.errorMsg}>{error}</div>}
            {success && <div style={styles.successMsg}>{success}</div>}

            <div style={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'email' ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'password' ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                ...styles.button,
                ...(isButtonHovered && !loading ? styles.buttonHover : {})
              }}
            >
              {loading && <span style={styles.loadingSpinner}></span>}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;