/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApplianceResponse {
  /** @example 1 */
  id: number;
  /** @example "Новый чайник" */
  applianceName: string;
  /** @example "http://localhost:9000/appliances/image-example.png" */
  imageUrl: string;
  /** @example "http://localhost:9000/appliances/video-example.mp4" */
  videoUrl: string;
  description: string | null;
  publicationStatus: 'draft' | 'published' | 'deleted';
  /** @example 2200 */
  powerWatts: number | null;
  /** @example 5 */
  minTemperature: number | null;
  imageFileName: string | null;
  videoFileName: string | null;
  /** @example 0 */
  likesCount: number;
  /** @example 0 */
  isOwner: 0 | 1;
  /** @example 0 */
  isLiked: 0 | 1;
  /** @format date-time */
  createdAt: string | null;
  /** @format date-time */
  formattedAt: string | null;
}

export interface CreateApplianceResponse {
  /** @example 1 */
  id: number;
  /** @example "Новый чайник" */
  applianceName: string;
  /** @example "http://localhost:9000/appliances/image-example.png" */
  imageUrl: string;
  /** @example "http://localhost:9000/appliances/video-example.mp4" */
  videoUrl: string;
}

export interface PublishApplianceDto {
  /** @example "Чайник для кипячения воды" */
  description: string;
  /**
   * Мощность, Вт
   * @min 0
   * @example 2200
   */
  powerWatts: number;
  /**
   * Минимальная температура, °C
   * @example 5
   */
  minTemperature: number;
}

export interface LikeDto {
  /** @example 1 */
  value: 0 | 1;
}

export interface RegisterUserDto {
  /**
   * @maxLength 128
   * @example "student"
   */
  userName: string;
  /**
   * @maxLength 64
   * @example "student@example.com"
   */
  email: string;
  /**
   * @format password
   * @maxLength 64
   * @example "example-password"
   */
  password: string;
}

export interface UserResponse {
  /** @example 1 */
  userId: number;
  /** @example "demo" */
  userName: string;
  /** @example "demo@example.com" */
  email: string;
}

export interface LoginUserDto {
  /**
   * @maxLength 64
   * @example "demo@example.com"
   */
  email: string;
  /**
   * @format password
   * @maxLength 64
   * @example "demo"
   */
  password: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || '',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === 'object'
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== 'string'
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Каталог приборов
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Приборы
     * @name GetAppliances
     * @summary Список опубликованных приборов с фильтрацией
     * @request GET:/api/appliances
     * @response `200` `(ApplianceResponse)[]`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `404` `void` Прибор или черновик не найден
     */
    getAppliances: (
      query?: {
        /**
         * Минимальная мощность, Вт
         * @min 0
         * @example 100
         */
        minPower?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApplianceResponse[], void>({
        path: `/api/appliances`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Приборы
     * @name CreateAppliance
     * @summary Далее: создать или обновить черновик с файлами
     * @request POST:/api/appliances
     * @secure
     * @response `200` `CreateApplianceResponse` Обновлён существующий черновик
     * @response `201` `CreateApplianceResponse`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `401` `void` Требуется вход
     * @response `404` `void` Прибор или черновик не найден
     */
    createAppliance: (
      data: {
        /**
         * @maxLength 256
         * @example "Новый чайник"
         */
        applianceName: string;
        /** @format binary */
        image: File;
        /** @format binary */
        video: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<CreateApplianceResponse, void>({
        path: `/api/appliances`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Приборы
     * @name GetApplianceFeed
     * @summary Первая опубликованная карточка ленты
     * @request GET:/api/appliances/feed
     * @response `200` `ApplianceResponse`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `404` `void` Прибор или черновик не найден
     */
    getApplianceFeed: (params: RequestParams = {}) =>
      this.request<ApplianceResponse, void>({
        path: `/api/appliances/feed`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Приборы
     * @name GetApplianceFeedById
     * @summary Карточка по ID или следующая карточка
     * @request GET:/api/appliances/feed/{id}
     * @response `200` `ApplianceResponse`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `404` `void` Прибор или черновик не найден
     */
    getApplianceFeedById: (
      id: number,
      query?: {
        /** true — перейти к следующей карточке */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApplianceResponse, void>({
        path: `/api/appliances/feed/${id}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Приборы
     * @name GetApplianceDraft
     * @summary Получить черновик текущего пользователя
     * @request GET:/api/appliances/draft
     * @secure
     * @response `200` `ApplianceResponse`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `401` `void` Требуется вход
     * @response `404` `void` Прибор или черновик не найден
     */
    getApplianceDraft: (params: RequestParams = {}) =>
      this.request<ApplianceResponse, void>({
        path: `/api/appliances/draft`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Приборы
     * @name PublishAppliance
     * @summary Опубликовать черновик
     * @request PUT:/api/appliances/draft
     * @secure
     * @response `200` `ApplianceResponse`
     * @response `400` `void` Некорректные параметры или тело запроса
     * @response `401` `void` Требуется вход
     * @response `404` `void` Прибор или черновик не найден
     */
    publishAppliance: (data: PublishApplianceDto, params: RequestParams = {}) =>
      this.request<ApplianceResponse, void>({
        path: `/api/appliances/draft`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags Приборы
 * @name DeleteAppliance
 * @summary Логически удалить свой прибор
 * @request DELETE:/api/appliances/{id}
 * @secure
 * @response `200` `{
    message?: string,
    id?: number,

}`
 * @response `400` `void` Некорректные параметры или тело запроса
 * @response `401` `void` Требуется вход
 * @response `403` `void` Нельзя удалить чужой прибор
 * @response `404` `void` Прибор или черновик не найден
 */
    deleteAppliance: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
          id?: number;
        },
        void
      >({
        path: `/api/appliances/${id}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags Приборы
 * @name SetApplianceLike
 * @summary Поставить или снять лайк
 * @request POST:/api/appliances/{id}/like
 * @secure
 * @response `200` `{
    applianceId?: number,
    value?: 0 | 1,
    likesCount?: number,
    isLiked?: 0 | 1,

}`
 * @response `400` `void` Некорректные параметры или тело запроса
 * @response `401` `void` Требуется вход
 * @response `404` `void` Прибор или черновик не найден
 */
    setApplianceLike: (id: number, data: LikeDto, params: RequestParams = {}) =>
      this.request<
        {
          applianceId?: number;
          value?: 0 | 1;
          likesCount?: number;
          isLiked?: 0 | 1;
        },
        void
      >({
        path: `/api/appliances/${id}/like`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name UserControllerRegister
     * @summary Зарегистрировать пользователя
     * @request POST:/api/users/register
     * @response `201` `UserResponse`
     * @response `409` `void` Имя или почта уже заняты
     */
    userControllerRegister: (
      data: RegisterUserDto,
      params: RequestParams = {},
    ) =>
      this.request<UserResponse, void>({
        path: `/api/users/register`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name UserControllerLogin
     * @summary Войти: создать сессию Redis и установить cookie sessionId
     * @request POST:/api/users/login
     * @response `200` `UserResponse`
     * @response `401` `void` Неверная почта или пароль
     */
    userControllerLogin: (data: LoginUserDto, params: RequestParams = {}) =>
      this.request<UserResponse, void>({
        path: `/api/users/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags Пользователи
 * @name UserControllerLogout
 * @summary Выйти: удалить сессию Redis и очистить cookie
 * @request POST:/api/users/logout
 * @secure
 * @response `200` `{
  /** @example "Вы вышли из аккаунта" *\/
    message?: string,

}`
 * @response `401` `void` Сессия отсутствует или истекла
 */
    userControllerLogout: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "Вы вышли из аккаунта" */
          message?: string;
        },
        void
      >({
        path: `/api/users/logout`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
