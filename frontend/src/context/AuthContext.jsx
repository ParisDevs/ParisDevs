import { createContext, useContext, useState } from "react";
import { loginUsuario } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    async function login(dados) {
        const usuarioRetornado = await loginUsuario(dados);

        setUsuario(usuarioRetornado);

        return usuarioRetornado;
    }

    function logout() {
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}