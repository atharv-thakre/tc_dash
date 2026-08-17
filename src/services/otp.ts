import { CreateOTPInput, CreateOTPResponse, DeleteOTPInput, OTPRecord } from '../types';
import {
  apiClient,
  getStoredApiMode,
  normalizeArrayResponse,
  normalizePaginatedResponse,
  PaginatedResult,
  requestWithFallback,
} from './apiClient';
import { INITIAL_OTP_RECORDS } from './mockData';

const DEMO_OTP_RECORDS_KEY = 'tc_auth_demo_otp_records';

function getDemoOTPRecords(): OTPRecord[] {
  const data = localStorage.getItem(DEMO_OTP_RECORDS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_OTP_RECORDS_KEY, JSON.stringify(INITIAL_OTP_RECORDS));
    return INITIAL_OTP_RECORDS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OTP_RECORDS;
  }
}

function saveDemoOTPRecords(records: OTPRecord[]) {
  localStorage.setItem(DEMO_OTP_RECORDS_KEY, JSON.stringify(records));
}

export const otpService = {
  // GET /otp/
  async listRecords(page: number = 1, limit: number = 10): Promise<PaginatedResult<OTPRecord>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoOTPRecords();
      const start = (page - 1) * limit;
      return {
        items: all.slice(start, start + limit),
        total: all.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/otp/', '/otp', '/otps/', '/otps'],
      { params: { page, limit } }
    );
    return normalizePaginatedResponse<OTPRecord>(resData);
  },

  // GET /otp/query or GET /otp/ with query filters
  async queryOTPRecords(
    field: string,
    value: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<OTPRecord>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoOTPRecords();
      const filtered = all.filter((otp: any) => {
        if (!value) return true;
        const val = String(otp[field] || '').toLowerCase();
        return val.includes(value.toLowerCase());
      });
      const start = (page - 1) * limit;
      return {
        items: filtered.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/otp/query', '/otp/query/', '/otp/', '/otp', '/otps/query', '/otps/'],
      {
        params: {
          field,
          value,
          [field]: value,
          query: value,
          page,
          limit,
        },
      }
    );
    return normalizePaginatedResponse<OTPRecord>(resData);
  },

  // POST /otp/
  async createOTP(input: CreateOTPInput): Promise<CreateOTPResponse> {
    const expirySeconds = Number(input.expiry ?? input.expires) || 300;
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const records = getDemoOTPRecords();
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + expirySeconds * 1000).toISOString();

      const newRecord: OTPRecord = {
        id: `otp_${Date.now()}`,
        identifier: input.identifier,
        purpose: input.purpose || 'login',
        code_hash: `$2a$12$demo_hash_${generatedCode}`,
        attempts: 0,
        expires_at,
        created_at: new Date().toISOString(),
      };

      records.unshift(newRecord);
      saveDemoOTPRecords(records);

      return {
        otp: generatedCode,
        expires_at,
      };
    }
    // Matching Pydantic CreateOTP schema: identifier: str, purpose: "login"|"signup"|"reset", expiry: int = 300
    const payload = {
      identifier: input.identifier,
      purpose: input.purpose || 'login',
      expiry: expirySeconds,
    };
    const resData = await requestWithFallback<any>('post', ['/otp/', '/otp', '/otps/'], payload);
    const data = resData?.data || resData || {};
    return {
      otp: String(data.otp || data.code || ''),
      expires_at: data.expires_at ?? data.expires ?? Math.floor(Date.now() / 1000) + expirySeconds,
    };
  },

  // DELETE /otp/
  async deleteOTP(input: DeleteOTPInput): Promise<boolean> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let records = getDemoOTPRecords();
      const initialCount = records.length;
      records = records.filter(
        (r) => !(r.identifier === input.identifier && r.purpose.toLowerCase() === input.purpose.toLowerCase())
      );
      saveDemoOTPRecords(records);
      return records.length < initialCount;
    }
    const resData = await requestWithFallback<any>('delete', ['/otp/', '/otp', '/otps/'], input);
    return resData === true || resData?.data === true || true;
  },

  // DELETE /otp/cleanup
  async cleanupExpired(): Promise<{ count: number }> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let records = getDemoOTPRecords();
      const now = new Date().getTime();
      const initialCount = records.length;
      records = records.filter((r) => new Date(r.expires_at).getTime() > now);
      saveDemoOTPRecords(records);
      return { count: initialCount - records.length };
    }
    const resData = await requestWithFallback<any>('delete', ['/otp/cleanup', '/otps/cleanup', '/otp/cleanup/']);
    return resData?.data || resData || { count: 0 };
  },

  // DELETE /otp/clear
  async clearAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveDemoOTPRecords([]);
      return null;
    }
    await requestWithFallback<any>('delete', ['/otp/clear', '/otps/clear', '/otp/clear/']);
    return null;
  },
};

