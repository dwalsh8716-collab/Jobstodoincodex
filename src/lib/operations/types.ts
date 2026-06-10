export type OperationsBackendState =
  | "disabled"
  | "missing_database_url"
  | "ready"
  | "unavailable";

export type OperationsBackendStatus = {
  enabled: boolean;
  configured: boolean;
  state: OperationsBackendState;
  message: string;
};

export type OperationWriteResult = {
  ok: boolean;
  required: boolean;
  id?: string;
  reason?: string;
};

export type DataSubjectRequestSummary = {
  id: string;
  requestType: string;
  requesterName: string;
  status: string;
  verificationStatus: string;
  dueAt?: string;
  createdAt: string;
};

export type OperationsOverview = {
  status: OperationsBackendStatus;
  enquiryCount: number;
  newEnquiryCount: number;
  candidateCount: number;
  applicationCount: number;
  openTaskCount: number;
  dataRequestCount: number;
  openDataRequestCount: number;
  latestEnquiries: Array<{
    id: string;
    name: string;
    enquiryType: string;
    serviceInterest?: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  latestDataRequests: DataSubjectRequestSummary[];
};
