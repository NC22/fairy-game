#include <SDL3/SDL.h>
#include <SDL3_image/SDL_image.h>

int main(int argc, char* argv[])
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
        return 1;

    SDL_Window* window = SDL_CreateWindow(
        "SDL3 PNG Test",
        800,
        600,
        0
    );

    SDL_Renderer* renderer = SDL_CreateRenderer(window, NULL);

    SDL_Surface* surf = IMG_Load("mice.png");
    if (!surf)
    {
        SDL_Log("PNG load error: %s", SDL_GetError());
        return 2;
    }

    SDL_Texture* tex = SDL_CreateTextureFromSurface(renderer, surf);
    SDL_DestroySurface(surf);

    bool running = true;
    SDL_Event e;

    while (running)
    {
        while (SDL_PollEvent(&e))
        {
            if (e.type == SDL_EVENT_QUIT)
                running = false;
        }

        SDL_SetRenderDrawColor(renderer, 20, 20, 30, 255);
        SDL_RenderClear(renderer);

        SDL_FRect dst = {200,150,256,256};
        SDL_RenderTexture(renderer, tex, NULL, &dst);

        SDL_RenderPresent(renderer);
    }

    SDL_DestroyTexture(tex);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}