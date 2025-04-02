
export const RequestService = (path, data) => {
    const header_data = {
        'Content-Type': 'application/json'
    }
    if (localStorage.getItem("token")){
        header_data["Authorization"] = `Bearer ${localStorage.getItem("token")}`
    }
    var body = JSON.stringify(data) 
    var path = `http://65.1.139.145:8081${path}`
    return fetch(path, {
        method: "POST",
        headers: header_data,
        body: body
    }).then(res => res.json())
}

