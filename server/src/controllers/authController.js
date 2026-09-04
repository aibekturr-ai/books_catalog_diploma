import * as authService from "../services/authService.js";

export async function register(req, res) {
  const result = await authService.registerUser(req.validatedBody);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await authService.loginUser(req.validatedBody);
  res.json(result);
}
