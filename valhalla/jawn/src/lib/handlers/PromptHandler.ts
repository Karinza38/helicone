import { PromiseGenericResult } from "../shared/result";
import { AbstractLogHandler } from "./AbstractLogHandler";
import { HandlerContext, TemplateWithInputs } from "./HandlerContext";

export class PromptHandler extends AbstractLogHandler {
  public async handle(context: HandlerContext): PromiseGenericResult<string> {
    console.log(`PromptHandler: ${context.message.log.request.id}`);
    // Process Helicone Template
    if (
      context.message.log.request.promptId &&
      context.message.log.request.heliconeTemplate
    ) {
      const assets = context.processedLog.assets;
      const heliconeTemplate = context.message.log.request.heliconeTemplate;

      // If assets are present, replace the inputs with the asset ids
      if (assets) {
        const inverseAssets: Map<string, string> = new Map();
        for (const [key, value] of Object.entries(assets)) {
          inverseAssets.set(value, key);
        }

        const inputs = Object.entries(heliconeTemplate.inputs).reduce<{
          [key: string]: string;
        }>((acc, [key, value]) => {
          const assetId = inverseAssets.get(value);
          acc[key] = assetId ? `<helicone-asset-id key="${assetId}"/>` : value;
          return acc;
        }, {});

        const processedTemplate: TemplateWithInputs = {
          template: heliconeTemplate.template,
          inputs: inputs,
        };

        context.processedLog.request.heliconeTemplate = processedTemplate;
      } else {
        // If no assets, just pass the template as is
        context.processedLog.request.heliconeTemplate = heliconeTemplate;
      }
    }

    return await super.handle(context);
  }
}