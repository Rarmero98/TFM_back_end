const bcrypt = require('bcryptjs');

const Users = require('../models/users.model');
const { createToken } = require('../helpers/utils');

const getAllUsers = async (req, res) => {
    try {
        const [users] = await Users.selectAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al recibir los usuarios" });
    }
}


const updateUser = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { name, email, username, phone } = req.body;

        const updateData = { name, email, username, phone };

        const [result] = await Users.updateUserById(user_id, updateData);

        if (result.affectedRows === 1) {
            const [[user]] = await Users.selectById(user_id);
            res.json(user);
        } else {
            res.status(400).json({ error: 'Error al actualizar el usuario' });
        }
    } catch (err) {
        console.error('Error updating user:', err);
        next(err);
    }
}


const deleteUser = async (req, res) => {
    const userId = req.params.user_id;
    try {
        await Users.deleteUserById(userId);
        res.status(200).json({ message: 'Se ha eliminado el usuario correctamente' });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar al usuario" });
    }
}

const register = async (req, res, next) => {
    req.body.password = bcrypt.hashSync(req.body.password, 9);

    try {
        const [result] = await Users.insert(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const [users] = await Users.selectByEmail(email);

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Error en email y/o password'
            });
        }

        const user = users[0];

        if (!user.password) {
            console.error('Password is undefined or null for user:', user);
            return res.status(500).json({
                error: 'Error interno del servidor. Por favor, contacte al administrador.'
            });
        }

        const check = bcrypt.compareSync(password, user.password);

        if (!check) {
            return res.status(401).json({
                error: 'Error en email y/o password'
            });
        }

        res.json({
            message: 'Login correcto',
            token: createToken(user)
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión'
        });
    }
};

const getProfile = (req, res) => {
    res.json(req.user);
}



module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    register,
    login,
    getProfile,
}