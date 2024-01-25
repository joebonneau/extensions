import React, { useState, useEffect } from "react";

import { List, Action, ActionPanel, closeMainWindow, clearSearchBar, popToRoot, showToast, Toast } from "@raycast/api";
import { getSessions, connectToSession } from "./sesh";
import { openApp } from "./app";

type Arguments = {
  args?: string;
  session?: string;
};
type Props = {
  fallbackText?: string;
  arguments: Arguments;
  launchType: string;
  launchContext?: string;
};

async function launchFromQuicklink(session: string, args: string): Promise<void> {
  try {
    await openApp();
    await connectToSession(session, args);
    await popToRoot();
    await closeMainWindow();
  } catch (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Couldn't connect to session",
      message: typeof error === "string" ? error : "Unknown reason",
    });
  }
}

export default function ConnectCommand(props: Props): React.JSX.Element {
  if (props.arguments.session) {
    // If we session is passed, then it means it was launched from the quicklink
    // and we should connect to the session without doing anything else.
    launchFromQuicklink(props.arguments.session, props.arguments.args);
    return <></>;
  }
  const [sessions, setSessions] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState(true);
  async function getAndSetSessions() {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't get sessions",
        message: typeof error === "string" ? error : "Unknown reason",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!props.arguments.session) {
      (async () => {
        await getAndSetSessions();
      })();
    }
  }, []);

  async function connect(session: string) {
    try {
      setIsLoading(true);
      await connectToSession(session);
      await openApp();
      await closeMainWindow();
      await clearSearchBar();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't connect to session",
        message: typeof error === "string" ? error : "Unknown reason",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      {sessions.map((session, index) => (
        <List.Item
          key={index}
          title={session}
          actions={
            <ActionPanel>
              <Action title="Connect to Session" onAction={() => connect(session)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
