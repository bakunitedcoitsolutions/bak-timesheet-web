import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const TZ = process.env.TZ || process.env.NEXT_PUBLIC_TZ || "Asia/Riyadh";

dayjs.extend(utc);
dayjs.extend(timezone);

// SET GLOBAL APP TIMEZONE (Saudi)
dayjs.tz.setDefault(TZ);

export default dayjs;
