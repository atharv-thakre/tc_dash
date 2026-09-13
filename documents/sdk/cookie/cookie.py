from typing import Optional, Dict, Any
from fastapi import Response, Request


class CookieConfig:
    """
    Data model representing Cookie Configuration in tc_auth.
    """
    def __init__(
        self,
        cookie_mode: bool = False,
        access_cookie_name: str = "access_token",
        refresh_cookie_name: str = "refresh_token",
        path: str = "/",
        domain: Optional[str] = None,
        secure: bool = False,
        httponly: bool = True,
        samesite: str = "lax",
        max_age: Optional[int] = None
    ):
        self.cookie_mode = cookie_mode
        self.access_cookie_name = access_cookie_name
        self.refresh_cookie_name = refresh_cookie_name
        self.path = path
        self.domain = domain
        self.secure = secure
        self.httponly = httponly
        self.samesite = samesite
        self.max_age = max_age


class CookieService:
    """
    Subsystem for managing HttpOnly session cookies in tc_auth.
    Available via `auth.cookie`.
    """

    def __init__(self, jwt_service=None):
        self.jwt = jwt_service
        self._config = CookieConfig()

    def config(
        self,
        cookie_mode: bool = False,
        access_cookie_name: str = "access_token",
        refresh_cookie_name: str = "refresh_token",
        path: str = "/",
        domain: Optional[str] = None,
        secure: bool = False,
        httponly: bool = True,
        samesite: str = "lax",
        max_age: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Configures the cookie subsystem parameters.
        """
        self._config.cookie_mode = cookie_mode
        self._config.access_cookie_name = access_cookie_name
        self._config.refresh_cookie_name = refresh_cookie_name
        self._config.path = path
        self._config.domain = domain
        self._config.secure = secure
        self._config.httponly = httponly
        self._config.samesite = samesite.lower() if samesite else "lax"
        self._config.max_age = max_age
        return self.load()

    def load(self) -> Dict[str, Any]:
        """
        Returns the active cookie subsystem configuration.
        """
        return {
            "cookie_mode": self._config.cookie_mode,
            "access_cookie_name": self._config.access_cookie_name,
            "refresh_cookie_name": self._config.refresh_cookie_name,
            "path": self._config.path,
            "domain": self._config.domain,
            "secure": self._config.secure,
            "httponly": self._config.httponly,
            "samesite": self._config.samesite,
            "max_age": self._config.max_age,
        }

    def is_cookie_mode(self) -> bool:
        """
        Returns True if cookie mode is enabled, False otherwise.
        """
        return bool(self._config.cookie_mode)

    def set_cookies(
        self,
        response: Response,
        access_token: str,
        refresh_token: Optional[str] = None
    ) -> None:
        """
        Attaches secure Set-Cookie headers for access token and optional refresh token.
        """
        if not self._config.cookie_mode or not response:
            return

        # Calculate max_age for access token
        access_max_age = self._config.max_age
        if access_max_age is None and self.jwt:
            if getattr(self.jwt, "dual_token_mode", False):
                access_max_age = getattr(self.jwt, "access_token_expire_minutes", 15) * 60
            else:
                access_max_age = getattr(self.jwt, "session_duration_days", 7) * 86400
        elif access_max_age is None:
            access_max_age = 7 * 86400

        response.set_cookie(
            key=self._config.access_cookie_name,
            value=access_token,
            max_age=access_max_age,
            path=self._config.path,
            domain=self._config.domain,
            secure=self._config.secure,
            httponly=self._config.httponly,
            samesite=self._config.samesite
        )

        if refresh_token:
            refresh_max_age = None
            if self.jwt:
                refresh_max_age = getattr(self.jwt, "refresh_token_expire_days", 7) * 86400
            else:
                refresh_max_age = 7 * 86400

            response.set_cookie(
                key=self._config.refresh_cookie_name,
                value=refresh_token,
                max_age=refresh_max_age,
                path=self._config.path,
                domain=self._config.domain,
                secure=self._config.secure,
                httponly=self._config.httponly,
                samesite=self._config.samesite
            )

    def clear_cookies(self, response: Response) -> None:
        """
        Clears session cookies by issuing Set-Cookie headers with max_age=0.
        """
        if not response:
            return

        response.delete_cookie(
            key=self._config.access_cookie_name,
            path=self._config.path,
            domain=self._config.domain,
            secure=self._config.secure,
            httponly=self._config.httponly,
            samesite=self._config.samesite
        )
        response.delete_cookie(
            key=self._config.refresh_cookie_name,
            path=self._config.path,
            domain=self._config.domain,
            secure=self._config.secure,
            httponly=self._config.httponly,
            samesite=self._config.samesite
        )

    def extract_token_from_request(self, request: Request) -> Optional[str]:
        """
        Extracts access token from request cookies.
        """
        if not request:
            return None
        return request.cookies.get(self._config.access_cookie_name)

    def extract_refresh_token_from_request(self, request: Request) -> Optional[str]:
        """
        Extracts refresh token from request cookies.
        """
        if not request:
            return None
        return request.cookies.get(self._config.refresh_cookie_name)
