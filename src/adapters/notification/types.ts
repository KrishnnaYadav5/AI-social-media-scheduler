export interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
  eventType: 
    | "draft_saved"
    | "publish_successful"
    | "publish_failed"
    | "ai_generation_complete"
    | "upload_successful"
    | "upload_failed"
    | "account_connected"
    | "account_disconnected";
}

export interface NotificationAdapter {
  sendNotification(payload: NotificationPayload): Promise<boolean>;
}
