"""
Reusable analytics: date range utilities and period resolution.

All dates in the DB are stored as MM/DD/YYYY strings from the CSV.
We parse them to Python date objects for comparison.
"""
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from typing import Tuple


def parse_db_date(value: str | None) -> date | None:
    """Parse MM/DD/YYYY string from DB into a date."""
    if not value:
        return None
    try:
        from datetime import datetime
        return datetime.strptime(str(value).strip(), "%m/%d/%Y").date()
    except Exception:
        try:
            from datetime import datetime
            return datetime.strptime(str(value).strip(), "%Y-%m-%d").date()
        except Exception:
            return None


def format_for_query(d: date) -> str:
    """Format date as MM/DD/YYYY for SQL LIKE or comparison against stored strings."""
    return d.strftime("%m/%d/%Y")


DateRange = Tuple[date, date]


def resolve_period(period: str, ref: date | None = None) -> DateRange:
    """
    Resolve a named period string to a (start, end) date range.
    """
    # Dataset spans 2016-01-01 to 2021-02-20
    DEFAULT_DATASET_MAX_DATE = date(2021, 2, 20)
    today = ref or DEFAULT_DATASET_MAX_DATE

    if period in ("all", "all_time"):
        return date(2016, 1, 1), date(2021, 2, 20)
    elif period == "today":

        return today, today
    elif period == "yesterday":
        d = today - timedelta(days=1)
        return d, d
    elif period == "this_week":
        start = today - timedelta(days=today.weekday())
        return start, today
    elif period == "last_week":
        start = today - timedelta(days=today.weekday() + 7)
        end = start + timedelta(days=6)
        return start, end
    elif period == "this_month":
        return today.replace(day=1), today
    elif period == "last_month":
        first_this = today.replace(day=1)
        last_prev = first_this - timedelta(days=1)
        return last_prev.replace(day=1), last_prev
    elif period == "this_quarter":
        q = (today.month - 1) // 3
        start = today.replace(month=q * 3 + 1, day=1)
        return start, today
    elif period == "last_quarter":
        q = (today.month - 1) // 3
        if q == 0:
            start = today.replace(year=today.year - 1, month=10, day=1)
            end = today.replace(year=today.year - 1, month=12, day=31)
        else:
            start = today.replace(month=(q - 1) * 3 + 1, day=1)
            end = today.replace(month=q * 3, day=1) - timedelta(days=1)
        return start, end
    elif period == "this_year":
        return today.replace(month=1, day=1), today
    elif period == "last_year":
        y = today.year - 1
        return date(y, 1, 1), date(y, 12, 31)
    elif ":" in period:
        parts = period.split(":")
        from datetime import datetime
        start = datetime.strptime(parts[0].strip(), "%Y-%m-%d").date()
        end = datetime.strptime(parts[1].strip(), "%Y-%m-%d").date()
        return start, end
    else:
        # default: last 30 days
        return today - timedelta(days=30), today


def comparable_prior_period(start: date, end: date) -> DateRange:
    """
    Return the comparable prior period.
    Same number of days, ending the day before start.
    """
    delta = (end - start).days
    prior_end = start - timedelta(days=1)
    prior_start = prior_end - timedelta(days=delta)
    return prior_start, prior_end


def format_period_label(start: date, end: date) -> str:
    return f"{start.strftime('%b %d, %Y')} – {end.strftime('%b %d, %Y')}"
