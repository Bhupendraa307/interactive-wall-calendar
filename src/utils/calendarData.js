import januaryImage   from './january.png'
import februaryImage  from './february.png'
import marchImage     from './march.png'
import aprilImage     from './april.png'
import mayImage       from './may.png'
import juneImage      from './june.png'
import julyImage      from './july.png'
import augustImage    from './august.png'
import septemberImage from './september.png'
import octoberImage   from './october.png'
import novemberImage  from './november.png'
import decemberImage  from './december.png'

/** Hero images per month — locally bundled PNGs (no CORS risk) */
export const HERO_IMAGES = [
  { url: januaryImage,   label: 'January'   },
  { url: februaryImage,  label: 'February'  },
  { url: marchImage,     label: 'March'     },
  { url: aprilImage,     label: 'April'     },
  { url: mayImage,       label: 'May'       },
  { url: juneImage,      label: 'June'      },
  { url: julyImage,      label: 'July'      },
  { url: augustImage,    label: 'August'    },
  { url: septemberImage, label: 'September' },
  { url: octoberImage,   label: 'October'   },
  { url: novemberImage,  label: 'November'  },
  { url: decemberImage,  label: 'December'  },
]

/**
 * Indian public holidays — key format: "MM-DD"
 * Rendered as amber dots with tooltip on calendar days.
 */
export const INDIAN_HOLIDAYS = {
  '01-01': "New Year's Day",
  '01-26': 'Republic Day',
  '04-14': 'Ambedkar Jayanti',
  '05-01': 'Labour Day',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '11-14': "Children's Day",
  '12-25': 'Christmas',
}

/** Returns holiday name for month (0-indexed) + day, or null */
export function getHoliday(month, day) {
  const key = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return INDIAN_HOLIDAYS[key] || null
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
