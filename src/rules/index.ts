import type { RuleDefinition } from '../engine/types'
import { fullwidthRule } from './fullwidthRule'
import { punctuationRule } from './punctuationRule'
import { spacingRule } from './spacingRule'

export const rules: RuleDefinition[] = [
  fullwidthRule,
  punctuationRule,
  spacingRule,
]
