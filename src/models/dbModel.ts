import connection from "../database";

class DataModel {
    public static locationMenu = async () => {
        try {
            const locationlist = await connection.query("SELECT DISTINCT LOCATION FROM geo", (err, rows) => {
                if (err) { throw err; }
                // locationlist = JSON.parse(JSON.stringify(rows));
            });
            return locationlist;
        } catch (err) {
            throw (err);
        }
    }
}

export default DataModel;
