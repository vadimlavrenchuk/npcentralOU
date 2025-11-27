import http from "./http";

export function getEquipment() {
  return http.get("/equipment");
}
