import { exec } from "child_process";
import { env } from "./env";

export function getSessions(args?: string) {
  return new Promise<string[]>((resolve, reject) => {
    exec(`sesh list ${args}`, { env }, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(error?.message ?? stderr);
      }
      const sessions = stdout.trim().split("\n");
      return resolve(sessions ?? []);
    });
  });
}

export function connectToSession(session: string, args?: string): Promise<void> {
  const cmd = `sesh connect --switch ${args ? args : ""} ${session}`;
  return new Promise<void>((resolve, reject) => {
    exec(cmd, { env }, (error, _, stderr) => {
      if (error || stderr) {
        console.error("error ", error);
        console.error("stderr ", stderr);
        return reject(error?.message ?? stderr);
      }
      return resolve();
    });
  });
}

// export function getZoxideResults() {
//   return new Promise<string[]>((resolve, reject) => {
//     exec("sesh list --zoxide", { env }, (error, stdout, stderr) => {
//       if (error || stderr) {
//         return reject(error?.message ?? stderr);
//       }
//       const sessions = stdout.trim().split("\n");
//       return resolve(sessions ?? []);
//     )};
//   });
// }
