import { CSSProperties, Dispatch, SetStateAction, useRef, useState } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const callAPI = async (username:string, password:string) => {
  const API_URL = "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup";
  const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsibmVvbm1ha3M5QGdtYWlsLmNvbSJdLCJpc3MiOiJoZW5uZ2UtYWRtaXNzaW9uLWNoYWxsZW5nZSIsInN1YiI6ImNoYWxsZW5nZSJ9.JCgxwQ47OBiYXHYeCwOqmu1HxAT5OVyp_bBhzAkRFX4";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ username, password })
    })

    return response.status;
  } catch (err) {
    return 500;
  }
};

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [satisfiedCriterias, setSatisfiedCriterias] = useState<boolean[]>([false, true, true, false, false, false]);
  const [disabledSubmit, setDisabledSubmit] = useState<boolean>(true);
  const [invalidUsername, setInvalidUsername] = useState<boolean>(true);

  const handleUsernameInput = () => {
    const username = usernameRef.current?.value;
    setInvalidUsername(username === null || username?.trim() === "");
  }

  const handlePasswordInput = () => {
    const password = passwordRef.current?.value;

    if (password) {
      const criterias = [
        password.length >= 10,
        password.length <= 24,
        !password.includes(" "),
        /\d/.test(password),
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
      ];

      setSatisfiedCriterias(criterias);
      setDisabledSubmit(criterias.includes(false));
    } else {
      setSatisfiedCriterias([false, true, true, false, false, false]);
    }
  }

  const handleSubmit = async () => {
    setStatus(null);
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if(username?.trim() === "") {
      return;
    }

    if(username && password) {
      const responseCode = await callAPI(username, password);

      switch (responseCode) {
        case 200:
          setUserWasCreated(true);
          break;
        case 400:
        case 422:
          setStatus("Sorry, the entered password is not allowed, please try a different one.");
          break;
        case 401:
        case 403:
          setStatus("Not authenticated to access this resource.");
          break;
        default:
          setStatus("Something went wrong, please try again.");
          break;
      }
    }
  }

  return (
    <div style={formWrapper}>
      <form style={form}>
        <label style={formLabel} htmlFor='username'>Username</label>
        <input id='username' style={formInput} aria-invalid={invalidUsername} ref={usernameRef} type='text' onChange={handleUsernameInput} />

        <label style={formLabel} htmlFor='password'>Password</label>
        <input id='password' style={formInput} aria-invalid={disabledSubmit} ref={passwordRef} type='password' onChange={handlePasswordInput} />
        <p>{status}</p>

        <button style={formButton} type='button' disabled={disabledSubmit} onClick={handleSubmit}>Create User</button>
      </form>
      {disabledSubmit && (
        <ul>
          {!satisfiedCriterias[0] && (<li>Password must be at least 10 characters long</li>)}
          {!satisfiedCriterias[1] && (<li>Password must be at most 24 characters long</li>)}
          {!satisfiedCriterias[2] && (<li>Password cannot contain spaces</li>)}
          {!satisfiedCriterias[3] && (<li>Password must contain at least one number</li>)}
          {!satisfiedCriterias[4] && (<li>Password must contain at least one uppercase letter</li>)}
          {!satisfiedCriterias[5] && (<li>Password must contain at least one lowercase letter</li>)}
        </ul>
      )}
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};
