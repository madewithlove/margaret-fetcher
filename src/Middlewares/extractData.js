export default response => {
    if (!response.data) {
        return response;
    }

    return response.data.data ? response.data.data : response.data;
};
