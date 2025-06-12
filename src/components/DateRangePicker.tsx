'use client'

import { Box } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { fr } from 'date-fns/locale'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
}

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box display='flex' gap={2}>
        <DatePicker
          label="Date de début"
          value={startDate}
          onChange={onStartDateChange}
          slotProps={{ textField: { fullWidth: true } }}
        />
        <DatePicker
          label="Date de fin"
          value={endDate}
          onChange={onEndDateChange}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Box>
    </LocalizationProvider>
  )
}

export default DateRangePicker 