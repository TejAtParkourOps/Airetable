import { startServer } from "./framework";
import socketIoRoutes from "./socketIoRoutes";
import restRoutes from "./restRoutes";

startServer(socketIoRoutes, restRoutes);
