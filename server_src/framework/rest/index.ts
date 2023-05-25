import {
  Express as Server
 } from "express";
import { RestRoutes } from "../types";

export function initializeRestApiServer(server: Server, routes: RestRoutes) {
  // server.on("error", (err) => {
  //   console.error(JSON.stringify(err));
  // });
  // register routes
  for (const r of routes) {
    server[r[0]](r[1], r[2]);
    console.debug(`Registered REST route: '${r[1]}'`);
  }
}
