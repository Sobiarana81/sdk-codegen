/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { ITransport, SDKResponse, IRequestInit } from "./transport"
import { IApiSettings } from "./apiSettings"
import { IAccessToken, IError } from "../sdk/models"

// TODO support impersonation and reporting user id of logged in user?
export interface IUserSession {
  // Authentication token
  token: IAccessToken
  isAuthenticated(): boolean
  authenticate(init: IRequestInit): IRequestInit
  login(): IAccessToken
  logout(): boolean
  transport: ITransport
  settings: IApiSettings
 }

export class UserSession implements IUserSession {
  _token: IAccessToken = {} as IAccessToken
  userId: string = ''
  tokenExpiresAt: Date = new Date()

  constructor (public settings: IApiSettings, public transport: ITransport) {
    this.settings = settings
    this.transport = transport
  }

  setToken(authToken: IAccessToken) {
    this._token = authToken
    let exp = new Date()
    if (authToken.access_token) {
      exp.setSeconds(exp.getSeconds() + authToken.expires_in)
    } else {
      exp.setSeconds(exp.getSeconds() - 10) // set to expire right now
    }
    this.tokenExpiresAt = exp
    return this._token
  }

  // Determines if the authentication token exists and has not expired
  isAuthenticated() {
    if (!this._token) return false
    if (!this.tokenExpiresAt) return false
    const now = new Date()
    const exp = this.tokenExpiresAt
    console.log({exp, now})
    return this.tokenExpiresAt > now
  }

  authenticate(init: IRequestInit) {
    init.headers.Authorization = this.token.access_token
    return init
  }

  get token() {
    if (!this.isAuthenticated()) {
      console.log('getting token')
      this.login()
    }
    return this._token
  }

  // Reset the user session
  private reset() {
    this._token = {} as IAccessToken
    this.tokenExpiresAt = new Date()
  }

  private async ok<TSuccess, TError> (promise: Promise<SDKResponse<TSuccess, TError>>) {
    const result = await promise
    if (result.ok) {
      console.log({result})
      return result.value
    } else {
      const anyResult = result as any
      if (typeof anyResult.error.message === 'string') {
        throw new Error(anyResult.error.message)
      } else {
        throw new Error('An unknown error occurred with the SDK method.')
      }
    }
  }

  // internal login method
  private async _login() {
    this.reset()
    // authenticate client
    const result = await this.ok(this.transport.request<IAccessToken, IError>('POST','/login',
      { client_id: this.settings.client_id, client_secret: this.settings.client_secret }))
    console.log({result})
    return result
  }

  login() {
    if (!this.isAuthenticated()) {
      this._login()
        .catch(e => { throw e})
        .then(value => this.setToken(value))
        .catch(e => {throw e})
    }
    return this._token
  }

  // login() {
  //   if (!this.isAuthenticated()) {
  //     // TODO unwrap this sync/async confusion
  //     this._login()
  //       .catch(e => { throw e})
  //       .then()
  //       .catch(e => { throw e})
  //   }
  //   return this.token
  // }

  private async _logout() {
    await this.ok(this.transport.request<string, IError>('DELETE', '/logout'))
    return true
  }

  logout() {
    let result = false
    if (this.isAuthenticated()) {
      this._logout()
        .catch(e => { throw e})
        .then(value => result = value)
        .catch(e => {throw e})
    }
    return result
  }

 }