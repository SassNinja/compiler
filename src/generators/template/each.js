import {
  BINDING_CONDITION_KEY,
  BINDING_GET_KEY_KEY,
  BINDING_TYPES,
  BINDING_TYPE_KEY,
  EACH_BINDING_TYPE,
  EACH_DIRECTIVE,
  IF_DIRECTIVE,
  KEY_ATTRIBUTE
} from './constants'
import {
  createSelectorProperties,
  createTemplateProperty,
  findAttribute,
  getAttributeExpression,
  getEachExpressionProperties,
  toScopedFunction
} from './utils'
import {nullNode, simplePropertyNode} from '../../utils/custom-ast-nodes'
import build from './builder'
import {builders} from '../../utils/build-types'
import compose from '../../utils/compose'
import {isCustom} from 'dom-nodes'
import tag from './tag'


/**
 * Transform a RiotParser.Node.Tag into an each binding
 * @param   { RiotParser.Node.Tag } node - tag containing the each attribute
 * @param   { string } selectorAttribute - attribute needed to select the target node
 * @param   { stiring } sourceFile - source file path
 * @param   { string } sourceCode - original source
 * @returns { AST.Node } an each binding node
 */
export default function createEachBinding(node, selectorAttribute, sourceFile, sourceCode) {
  const ifAttribute = findAttribute(node, IF_DIRECTIVE)
  const eachAttribute = findAttribute(node, EACH_DIRECTIVE)
  const keyAttribute = findAttribute(node, KEY_ATTRIBUTE)
  const mightBeARiotComponent = isCustom(node.name)
  const attributeOrNull = attribute => attribute ? toScopedFunction(getAttributeExpression(attribute), sourceFile, sourceCode) : nullNode()

  return builders.objectExpression([
    simplePropertyNode(BINDING_TYPE_KEY,
      builders.memberExpression(
        builders.identifier(BINDING_TYPES),
        builders.identifier(EACH_BINDING_TYPE),
        false
      ),
    ),
    simplePropertyNode(BINDING_GET_KEY_KEY, attributeOrNull(keyAttribute)),
    simplePropertyNode(BINDING_CONDITION_KEY, attributeOrNull(ifAttribute)),
    createTemplateProperty(
      (mightBeARiotComponent ? tag : build)(node, sourceCode, sourceCode)
    ),
    ...createSelectorProperties(selectorAttribute),
    ...compose(getEachExpressionProperties, getAttributeExpression)(eachAttribute)
  ])
}