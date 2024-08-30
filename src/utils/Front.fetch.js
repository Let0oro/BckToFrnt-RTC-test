export class FrontFetch {
  static baseUrl = "http://localhost:3000/api/v1/";

  static parseMethod = {
    user: {
      get: { get: "/", isLog: "/is_logged_in" },
      post: {
        register: "/register",
        login: "/login",
        logout: "/logout",
        refreshToken: "/refresh-token",
        chooseAdmin: "/admin",
      },
      put: "/add_event/",
      delete: "/",
    },
    events: {
      get: { get: "/", myEvents: "/my_events" },
      post: "/",
      put: "/update/",
      delete: "/",
    },
  };

  static async toFormData(form, files = {}) {
    const formData = new FormData();

    for (const key in form) {
      formData.append(key, (typeof form[key] == "object" ? JSON.stringify(form[key]) : form[key]));
    }

    formData.append("image", files);
    
    return form ? formData : null;
  }

  static async Fetch(url, opts = {}) {
    try {
      const response = await fetch(url, { ...opts });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.statusText || "Error en la solicitud");
      }

      return data;
    } catch (error) {
      console.error("Fetch error: " + error);
      throw error;
    }
  }

  static async caller(route, formData, opts = {}) {
    const { toFormData, parseMethod } = this;
    const { name, method, action, id, status } = route;
    const pMethodLite = parseMethod[name][method];
    const pMethod = action ? pMethodLite[action] : pMethodLite;

    opts = {
      method: method.toUpperCase(),
      ...opts
    };

    let image;
    if (formData) image = formData?.image;
    if (image) delete formData.image;
    formData = await (image ? toFormData(formData, image) : toFormData(formData));

    if (formData) opts.body = formData;
    if (name != "user" || method != "get") opts.credentials = "include";

    return await this.Fetch(
      `${this.baseUrl}${name}${pMethod}${id || ""}${(id && status) ? "/"+status : ""}`,
      opts
    );
  }
}

export const frontFetchObj = {

}
