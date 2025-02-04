import { Box, Button, ButtonGroup } from "@chakra-ui/react";

import { ChatCraftAiMessage } from "../../lib/ChatCraftMessage";
import AiMessage from "./AiMessage";

type NewMessageProps = {
  message: ChatCraftAiMessage;
  chatId: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onCancel: () => void;
};

function NewMessage({ message, chatId, isPaused, onTogglePause, onCancel }: NewMessageProps) {
  return (
    <>
      <AiMessage
        key={message.id}
        message={message}
        chatId={chatId}
        editing={false}
        onEditingChange={/* ignore editing changes while streaming new response */ () => {}}
        isLoading
        heading={message.model.prettyModel}
      />
      <Box textAlign="center">
        <ButtonGroup>
          <Button variant="outline" size="xs" onClick={() => onCancel()}>
            Cancel
          </Button>

          {isPaused ? (
            <Button key="resume" size="xs" onClick={() => onTogglePause()}>
              Resume
            </Button>
          ) : (
            <Button key="pause" size="xs" onClick={() => onTogglePause()}>
              Pause
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </>
  );
}

export default NewMessage;
